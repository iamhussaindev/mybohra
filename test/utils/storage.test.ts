import * as storage from "app/utils/storage"

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage)

describe("storage utils", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("load", () => {
    it("should load data from AsyncStorage", async () => {
      const testData = { key: "value" }
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData))

      const result = await storage.load("test-key")

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith("test-key")
      expect(result).toEqual(testData)
    })

    it("should return null for non-existent key", async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null)

      const result = await storage.load("non-existent-key")

      expect(result).toBeNull()
    })

    it("should handle invalid JSON", async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce("invalid-json")

      const result = await storage.load("invalid-key")

      expect(result).toBeNull()
    })

    it("should handle AsyncStorage errors", async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error("Storage error"))

      const result = await storage.load("error-key")

      expect(result).toBeNull()
    })
  })

  describe("save", () => {
    it("should save data to AsyncStorage", async () => {
      const testData = { key: "value" }
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined)

      await storage.save("test-key", testData)

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("test-key", JSON.stringify(testData))
    })

    it("should handle AsyncStorage errors", async () => {
      const testData = { key: "value" }
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error("Storage error"))

      // Should not throw
      await expect(storage.save("error-key", testData)).resolves.toBeUndefined()
    })

    it("should handle null data", async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined)

      await storage.save("null-key", null)

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith("null-key", JSON.stringify(null))
    })
  })

  describe("remove", () => {
    it("should remove data from AsyncStorage", async () => {
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined)

      await storage.remove("test-key")

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith("test-key")
    })

    it("should handle AsyncStorage errors", async () => {
      mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error("Storage error"))

      // Should not throw
      await expect(storage.remove("error-key")).resolves.toBeUndefined()
    })
  })

  describe("clear", () => {
    it("should clear all data from AsyncStorage", async () => {
      mockAsyncStorage.clear.mockResolvedValueOnce(undefined)

      await storage.clear()

      expect(mockAsyncStorage.clear).toHaveBeenCalled()
    })

    it("should handle AsyncStorage errors", async () => {
      mockAsyncStorage.clear.mockRejectedValueOnce(new Error("Storage error"))

      // Should not throw
      await expect(storage.clear()).resolves.toBeUndefined()
    })
  })

  describe("keys", () => {
    it("should get all keys from AsyncStorage", async () => {
      const testKeys = ["key1", "key2", "key3"]
      mockAsyncStorage.getAllKeys.mockResolvedValueOnce(testKeys)

      const result = await storage.keys()

      expect(mockAsyncStorage.getAllKeys).toHaveBeenCalled()
      expect(result).toEqual(testKeys)
    })

    it("should handle AsyncStorage errors", async () => {
      mockAsyncStorage.getAllKeys.mockRejectedValueOnce(new Error("Storage error"))

      const result = await storage.keys()

      expect(result).toEqual([])
    })
  })

  describe("multiLoad", () => {
    it("should load multiple keys from AsyncStorage", async () => {
      const testKeys = ["key1", "key2"]
      const testData = [
        ["key1", JSON.stringify({ value1: "data1" })],
        ["key2", JSON.stringify({ value2: "data2" })],
      ]
      mockAsyncStorage.multiGet.mockResolvedValueOnce(testData)

      const result = await storage.multiLoad(testKeys)

      expect(mockAsyncStorage.multiGet).toHaveBeenCalledWith(testKeys)
      expect(result).toEqual({
        key1: { value1: "data1" },
        key2: { value2: "data2" },
      })
    })

    it("should handle null values in multiGet", async () => {
      const testKeys = ["key1", "key2"]
      const testData = [
        ["key1", JSON.stringify({ value1: "data1" })],
        ["key2", null],
      ]
      mockAsyncStorage.multiGet.mockResolvedValueOnce(testData)

      const result = await storage.multiLoad(testKeys)

      expect(result).toEqual({
        key1: { value1: "data1" },
        key2: null,
      })
    })

    it("should handle AsyncStorage errors", async () => {
      const testKeys = ["key1", "key2"]
      mockAsyncStorage.multiGet.mockRejectedValueOnce(new Error("Storage error"))

      const result = await storage.multiLoad(testKeys)

      expect(result).toEqual({})
    })
  })

  describe("multiSave", () => {
    it("should save multiple key-value pairs to AsyncStorage", async () => {
      const testData = {
        key1: { value1: "data1" },
        key2: { value2: "data2" },
      }
      mockAsyncStorage.multiSet.mockResolvedValueOnce(undefined)

      await storage.multiSave(testData)

      expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith([
        ["key1", JSON.stringify({ value1: "data1" })],
        ["key2", JSON.stringify({ value2: "data2" })],
      ])
    })

    it("should handle AsyncStorage errors", async () => {
      const testData = { key1: { value1: "data1" } }
      mockAsyncStorage.multiSet.mockRejectedValueOnce(new Error("Storage error"))

      // Should not throw
      await expect(storage.multiSave(testData)).resolves.toBeUndefined()
    })
  })

  describe("multiRemove", () => {
    it("should remove multiple keys from AsyncStorage", async () => {
      const testKeys = ["key1", "key2"]
      mockAsyncStorage.multiRemove.mockResolvedValueOnce(undefined)

      await storage.multiRemove(testKeys)

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith(testKeys)
    })

    it("should handle AsyncStorage errors", async () => {
      const testKeys = ["key1", "key2"]
      mockAsyncStorage.multiRemove.mockRejectedValueOnce(new Error("Storage error"))

      // Should not throw
      await expect(storage.multiRemove(testKeys)).resolves.toBeUndefined()
    })
  })

  describe("integration", () => {
    it("should handle complete save/load cycle", async () => {
      const testData = { complex: { nested: { data: "value" } } }

      // Save
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined)
      await storage.save("integration-test", testData)

      // Load
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData))
      const result = await storage.load("integration-test")

      expect(result).toEqual(testData)
    })

    it("should handle save/remove cycle", async () => {
      const testData = { key: "value" }

      // Save
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined)
      await storage.save("remove-test", testData)

      // Remove
      mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined)
      await storage.remove("remove-test")

      // Try to load (should return null)
      mockAsyncStorage.getItem.mockResolvedValueOnce(null)
      const result = await storage.load("remove-test")

      expect(result).toBeNull()
    })
  })
})
