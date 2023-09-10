const {
  createTag,
  updateTag,
  getTagById,
  getAllTags,
  deleteTag,
} = require("../adminController");
const { Response } = require("jest-express/lib/response");
const { Request } = require("jest-express/lib/request");
const TagService = require("../../services/admin/tagService");
const constants = require("../../../constants/common");
const errorMessages = constants.errorMessages;

// Mocks
const mockDateCreated = new Date();
const mockDateUpdated = new Date(mockDateCreated.getTime() + 1000); // 1 second later
const mockError = new Error("TagService error");

jest.mock("../../services/admin/tagService.js");
let req, res, next;

beforeEach(() => {
  req = new Request();
  res = new Response();
  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("createTag", () => {
  const testCases = [
    {
      description: "should create a valid tag",
      input: { name: "Tag 1" },
      expectedStatusCode: 200,
      expectedResponseBody: {
        id: 1,
        name: "Tag 1",
        dateCreated: mockDateCreated,
      },
    },
    {
      description: "should not create a tag with more than 16 characters",
      input: { name: "TagNameHasMoreThan16Chars" },
      expectedStatusCode: 400,
      expectedResponseBody: { message: errorMessages.INVALID_TAG },
    },
    {
      description: "should not create a tag with an empty name",
      input: { name: "" },
      expectedStatusCode: 400,
      expectedResponseBody: { message: errorMessages.INVALID_TAG },
    },
  ];

  TagService.createTag.mockResolvedValue({
    id: 1,
    name: "Tag 1",
    dateCreated: mockDateCreated,
  });

  // Run tests for each test case
  testCases.forEach((testCase) => {
    it(testCase.description, async () => {
      // Arrange
      req.setBody(testCase.input);

      // Act
      await createTag(req, res, next);

      // Assert
      expect(res.statusCode).toBe(testCase.expectedStatusCode);
      expect(res.body).toEqual(testCase.expectedResponseBody);
    });
  });

  it("should handle errors from TagService", async () => {
    // Arrange
    req.setBody({ name: "Test Name" });
    TagService.createTag.mockRejectedValue(mockError);

    // Act
    await createTag(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe("updateTag", () => {
  const testCases = [
    {
      description: "should update a tag",
      input: { id: "1", name: "Updated" },
      expectedStatusCode: 200,
      expectedResponseBody: {
        id: 1,
        name: "Tag Updated",
        dateCreated: mockDateCreated,
        dateUpdated: mockDateUpdated,
      },
    },
    {
      description: "should not update a tag with more than 16 characters",
      input: { id: "1", name: "TagNameHasMoreThan16Chars" },
      expectedStatusCode: 400,
      expectedResponseBody: { message: errorMessages.INVALID_TAG },
    },
    {
      description: "should not update a tag with an empty name",
      input: { id: "1", name: "" },
      expectedStatusCode: 400,
      expectedResponseBody: { message: errorMessages.INVALID_TAG },
    },
    {
      description: "should not update a tag with an invalid Tag ID",
      input: { id: "invalid_id", name: "Tag Updated" },
      expectedStatusCode: 400,
      expectedResponseBody: { message: errorMessages.INVALID_ID },
    },
  ];

  TagService.updateTag.mockResolvedValue({
    id: 1,
    name: "Tag Updated",
    dateCreated: mockDateCreated,
    dateUpdated: mockDateUpdated,
  });

  // Run tests for each test case
  testCases.forEach((testCase) => {
    it(testCase.description, async () => {
      // Arrange
      req.setBody({ name: testCase.input.name });
      req.setParams({ id: testCase.input.id });

      // Act
      await updateTag(req, res, next);

      // Assert
      expect(res.statusCode).toBe(testCase.expectedStatusCode);
      expect(res.body).toEqual(testCase.expectedResponseBody);
    });
  });

  it("should handle errors from TagService", async () => {
    // Arrange
    req.setBody({ name: "Test Name" });
    req.setParams({ id: "1" });
    TagService.updateTag.mockRejectedValue(mockError);

    // Act
    await updateTag(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe("getAllTags", () => {
  it("should return all tags", async () => {
    // Arrange
    const mockTags = [
      { id: 1, name: "Tag 1", dateCreated: mockDateCreated },
      { id: 2, name: "Tag 2", dateCreated: mockDateCreated },
    ];
    TagService.getAllTags.mockResolvedValue(mockTags);

    // Act
    await getAllTags(req, res, next);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTags);
  });

  it("should handle errors from TagService", async () => {
    // Arrange
    TagService.getAllTags.mockRejectedValue(mockError);

    // Act
    await getAllTags(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe("getTagById", () => {
  it("should return a tag with valid ID", async () => {
    // Arrange
    const tagId = 1;
    const mockTag = {
      id: tagId,
      name: "Tag 1",
      dateCreated: mockDateCreated,
    };
    TagService.getTagById.mockResolvedValue(mockTag);
    req.setParams({ id: tagId.toString() });

    // Act
    await getTagById(req, res, next);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockTag);
  });

  it("should not return a tag if tagId is invalid", async () => {
    // Arrange
    const invalidTagId = "invalid_id";
    req.setParams({ id: invalidTagId });

    // Act
    await getTagById(req, res, next);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: errorMessages.INVALID_ID });
  });

  it("should handle errors from TagService", async () => {
    // Arrange
    req.setParams({ id: "1" });
    TagService.getTagById.mockRejectedValue(mockError);

    // Act
    await getTagById(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
  });
});

describe("deleteTag", () => {
  it("should delete a tag", async () => {
    // Arrange
    req.setParams({ id: "1" });
    TagService.deleteTag.mockResolvedValue(null);

    // Act
    await deleteTag(req, res, next);

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe("Tag successfully deleted");
  });

  it("should not delete a tag if tagId is invalid", async () => {
    // Arrange
    req.setParams({ id: "invalid_id" });

    // Act
    await deleteTag(req, res, next);

    // Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: errorMessages.INVALID_ID });
  });

  it("should handle errors from TagService", async () => {
    // Arrange
    req.setParams({ id: "1" });
    TagService.deleteTag.mockRejectedValue(mockError);

    // Act
    await deleteTag(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
