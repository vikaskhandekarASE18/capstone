import { Router } from 'express';
import { pool } from '../config/database';
import { createError } from '../middleware/errorHandler';

export const booksRouter = Router();

// GET /api/books
booksRouter.get('/', async (req, res, next) => {
  try {
    const { search, categoryId, brandId, minPrice, maxPrice, sortBy, page = '1', limit = '20' } = req.query as Record<string, string>;

    let query = `
      SELECT b.*, c.name as category_name, c.slug as category_slug,
             p.name as publisher_name, br.name as brand_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN publishers p ON b.publisher_id = p.id
      LEFT JOIN brands br ON b.brand_id = br.id
      WHERE b.is_active = true
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex} OR b.isbn = $${paramIndex + 1})`;
      params.push(`%${search}%`, search);
      paramIndex += 2;
    }
    if (categoryId) {
      query += ` AND b.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    if (brandId) {
      query += ` AND b.brand_id = $${paramIndex}`;
      params.push(brandId);
      paramIndex++;
    }
    if (minPrice) {
      query += ` AND b.price >= $${paramIndex}`;
      params.push(Number(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      query += ` AND b.price <= $${paramIndex}`;
      params.push(Number(maxPrice));
      paramIndex++;
    }

    const sortMap: Record<string, string> = {
      price_asc: 'b.price ASC',
      price_desc: 'b.price DESC',
      rating: 'b.rating DESC',
      newest: 'b.published_year DESC',
      popular: 'b.review_count DESC',
    };
    query += ` ORDER BY ${sortMap[sortBy] ?? 'b.review_count DESC'}`;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    const countQuery = query.replace(/SELECT b\.\*.*?FROM books b/s, 'SELECT COUNT(*) FROM books b');
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      success: true,
      data: dataResult.rows.map(mapBook),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
booksRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as category_name, c.slug as category_slug,
              p.name as publisher_name, br.name as brand_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN publishers p ON b.publisher_id = p.id
       LEFT JOIN brands br ON b.brand_id = br.id
       WHERE b.id = $1 AND b.is_active = true`,
      [req.params.id]
    );
    if (result.rows.length === 0) return next(createError('Book not found', 404));
    res.json({ success: true, data: mapBook(result.rows[0]) });
  } catch (err) {
    next(err);
  }
});

function mapBook(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    price: parseFloat(row.price as string),
    originalPrice: row.original_price ? parseFloat(row.original_price as string) : undefined,
    description: row.description,
    imageUrl: row.image_url,
    categoryId: row.category_id,
    category: row.category_name ? { id: row.category_id, name: row.category_name, slug: row.category_slug } : undefined,
    publisher: row.publisher_name ? { id: row.publisher_id, name: row.publisher_name } : undefined,
    brand: row.brand_name ? { id: row.brand_id, name: row.brand_name } : undefined,
    stock: row.stock,
    rating: parseFloat(row.rating as string),
    reviewCount: row.review_count,
    isFeatured: row.is_featured,
    language: row.language,
    pages: row.pages,
    publishedYear: row.published_year,
    tags: row.tags,
  };
}
