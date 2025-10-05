// 简化的书籍模型 - 用于故事生成API
const fs = require('fs');
const path = require('path');

// 数据存储目录
const DATA_DIR = path.join(__dirname, '../data');

// 确保数据目录存在
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// 初始化数据库（简化版本）
const initDatabase = async () => {
  try {
    ensureDataDir();
    console.log('数据库初始化成功');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 简化的书籍模型
class BookModel {
  static async create(inputText) { // 添加create方法
    try {
      ensureDataDir();
      const bookId = `book_${Date.now()}`;
      const bookData = {
        id: bookId,
        inputText: inputText,
        status: 'created',
        createdAt: new Date().toISOString()
      };
      
      const filename = `${bookId}.json`;
      const filepath = path.join(DATA_DIR, filename);
      
      await fs.promises.writeFile(filepath, JSON.stringify(bookData, null, 2));
      return { id: bookId, ...bookData };
    } catch (error) {
      console.error('创建书籍失败:', error);
      throw error;
    }
  }

  static async updateStory(bookId, storyData) { // 添加updateStory方法
    try {
      const filename = `${bookId}.json`;
      const filepath = path.join(DATA_DIR, filename);
      
      let bookData = {};
      if (fs.existsSync(filepath)) {
        const data = await fs.promises.readFile(filepath, 'utf8');
        bookData = JSON.parse(data);
      }
      
      bookData.story = storyData;
      bookData.updatedAt = new Date().toISOString();
      
      await fs.promises.writeFile(filepath, JSON.stringify(bookData, null, 2));
      return bookData;
    } catch (error) {
      console.error('更新故事失败:', error);
      throw error;
    }
  }

  static async updateStatus(bookId, status) { // 添加updateStatus方法
    try {
      const filename = `${bookId}.json`;
      const filepath = path.join(DATA_DIR, filename);
      
      let bookData = {};
      if (fs.existsSync(filepath)) {
        const data = await fs.promises.readFile(filepath, 'utf8');
        bookData = JSON.parse(data);
      }
      
      bookData.status = status;
      bookData.updatedAt = new Date().toISOString();
      
      await fs.promises.writeFile(filepath, JSON.stringify(bookData, null, 2));
      return bookData;
    } catch (error) {
      console.error('更新状态失败:', error);
      throw error;
    }
  }

  static async save(bookData) {
    try {
      ensureDataDir();
      const filename = `book_${Date.now()}.json`;
      const filepath = path.join(DATA_DIR, filename);
      
      await fs.promises.writeFile(filepath, JSON.stringify(bookData, null, 2));
      return { id: filename, path: filepath };
    } catch (error) {
      console.error('保存书籍失败:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const filepath = path.join(DATA_DIR, id);
      const data = await fs.promises.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('查找书籍失败:', error);
      return null;
    }
  }

  static async list() {
    try {
      ensureDataDir();
      const files = await fs.promises.readdir(DATA_DIR);
      const books = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const data = await this.findById(file);
            if (data) {
              books.push({ id: file, ...data });
            }
          } catch (error) {
            console.error(`读取文件 ${file} 失败:`, error);
          }
        }
      }
      
      return books;
    } catch (error) {
      console.error('列出书籍失败:', error);
      return [];
    }
  }

  // 添加getAll方法以支持分页
  static async getAll(page = 1, limit = 10) {
    try {
      const books = await this.list();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      return {
        data: books.slice(startIndex, endIndex),
        total: books.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(books.length / limit)
      };
    } catch (error) {
      console.error('获取书籍列表失败:', error);
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }
  }

  // 添加getById方法
  static async getById(id) {
    try {
      return await this.findById(`${id}.json`);
    } catch (error) {
      console.error('获取书籍失败:', error);
      return null;
    }
  }
}

module.exports = {
  BookModel,
  initDatabase
};