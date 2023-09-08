const express = require("express");
const createError = require("http-errors");
const morgan = require("morgan");
require("dotenv").config();
const cors = require("cors");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./api/middlewares/customErrorHandle');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

// enable cors
const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3002"],
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/", async (req, res, next) => {
  res.send({ message: "Awesome it works 🐻" });
});

// swagger api documentation
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
  },
}

const options = {
  swaggerDefinition,
  apis: ['src/api/routes/*.js'],
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
};

const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger UI and API documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use("/api", require('./api/routes/index'));

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
