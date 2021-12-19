const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());


const costumers = [];

// Middleware

function verifyIfAccountExistsCPF(request, response, next) {
  const { cpf } = request.headers;
  const costumer = costumers.find(costumer => costumer.cpf === cpf);

  if (!costumer) {
    return response.status(400).json({ error: 'Account not found' });
  }

  request.costumer = costumer;
  return next();
}

// Caminhos

app.get("/account", (request, response) => {
    return response.status(200).json(costumers);
});

app.post("/account", (request, response) => {
    const { name, cpf } = request.body;

    const costumerAlreadyExists = costumers.find( costumer => costumer.cpf === cpf );

    if (costumerAlreadyExists) {
        return response.status(400).json({ error: "Costumer already exists" });
    }

    const costumer = {
        id: uuidv4(),
        name,
        cpf,
        statement: []
    }

    costumers.push(costumer);

    return response.status(201).send();
});

app.put("/account", verifyIfAccountExistsCPF, (request, response) => {
    const { name } = request.body;
    const { costumer } = request;

    costumer.name = name;

    return response.status(200).send();
})

app.delete("/account", (request, response) => {
    const { cpf } = request.headers;

    const costumerIndex = costumers.findIndex( costumer => costumer.cpf === cpf );

    if (costumerIndex < 0) {
        return response.status(400).json({ error: "Costumer not found" });
    }

    costumers.splice(costumerIndex, 1);

    return response.status(204).send();
});

app.get("/statement", verifyIfAccountExistsCPF, (request, response) => {
    const { costumer } = request;

    return response.status(200).json(costumer.statement);
});

app.post("/deposit", verifyIfAccountExistsCPF, (request, response) => {
    const { description, amount } = request.body;
    const { costumer } = request;

    const deposit = {
        id: uuidv4(),
        description: description,
        amount: amount,
        date: new Date(),
        type: "credit"
    }

    costumer.statement.push(deposit);

    return response.status(201).send();
});

app.post("/withdraw", verifyIfAccountExistsCPF, (request, response) => {
    const { description, amount } = request.body;
    const { costumer } = request;

    const withdraw = {
        id: uuidv4(),
        description: description,
        amount: amount,
        date: new Date(),
        type: "debit"
    }

    costumer.statement.push(withdraw);

    return response.status(201).send();
});

app.get("/statement/date", verifyIfAccountExistsCPF, (request, response) => {
    const { costumer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = costumer.statement.filter( statement => statement.date.toDateString() === new Date(dateFormat).toDateString() );
    return response.json(statement);
});

app.listen(3333);