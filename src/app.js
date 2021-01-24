const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require("uuid");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) return response.status(400).json({ error: "invalid uuid" });

  return next();
}

function validateRepositoryUrl(request, response, next) {
  const { url } = request.body;

  if (url) {
    if (
      !(
        url.startsWith("http://github.com/") ||
        url.startsWith("https://github.com/")
      )
    ) {
      return response
        .status(400)
        .json({ error: "It's not a valid github repository url" });
    }
  }

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", validateRepositoryUrl, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = { id: uuid(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put(
  "/repositories/:id",
  validateId,
  validateRepositoryUrl,
  (request, response) => {
    const { title, url, techs } = request.body;
    const { id } = request.params;

    const repositoryIndex = repositories.findIndex((repo) => repo.id == id);

    if (repositoryIndex < 0)
      return response.status(400).json({ error: "Repository not found." });

    const newRepo = {
      id: id,
      title: title,
      url: url,
      techs: techs,
      likes: repositories[repositoryIndex].likes,
    };

    repositories[repositoryIndex] = newRepo;

    return response.json(newRepo);
  }
);

app.delete("/repositories/:id", validateId, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repo) => repo.id == id);

  if (repositoryIndex < 0)
    return response.status(400).json({ error: "Repository not found." });

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateId, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repo) => repo.id == id);

  if (repositoryIndex < 0)
    return response.status(400).json({ error: "Repository not found." });

  repositories[repositoryIndex].likes++;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
