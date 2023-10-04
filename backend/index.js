const express = require("express");
const axios = require("axios");
const _ = require("lodash");

const app = express();

const middleware = (req, res, next) => {
  const url = "https://intent-kit-16.hasura.app/api/rest/blogs";
  const adminSecret =
    "32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6";

  axios
    .get(url, {
      headers: {
        "x-hasura-admin-secret": adminSecret,
      },
    })
    .then((response) => {
      req.blogData = response.data.blogs;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: err });
    });
};

app.get("/api/blog-stats", middleware, (req, res) => {
  const { blogData } = req;

  const totalBlogs = blogData.length;

  const longestTitle = _.maxBy(blogData, "title");

  const blogPrivacy = _.filter(blogData, (blog) =>
    _.includes(_.toLower(blog.title), "privacy")
  );
  const numBlogPrivacy = blogPrivacy.length;

  const uniqueTitle = _.uniqBy(blogData, "title").map((blog) => blog.title);

  res.json({ totalBlogs, longestTitle, numBlogPrivacy, uniqueTitle });
});

app.get("/api/blog-search", middleware, (req, res) => {
  const searchTerm = req.query.query;
  if (!searchTerm) {
    return res.status(400).json({ error: "Missing search query" });
  }

  const { blogData } = req;

  const matchedBlog = blogData.filter((blog) => {
    const lowercaseTitle = blog.title.toLowerCase();
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return lowercaseTitle.includes(lowercaseSearchTerm);
  });

  res.json(matchedBlog);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
