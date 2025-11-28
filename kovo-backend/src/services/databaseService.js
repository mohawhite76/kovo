import { supabaseAdmin } from '../config/supabase.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

class DatabaseService {
  async findById(table, id, select = '*') {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(select)
      .eq('id', id)
      .single();

    if (error) {
      logger.error(`Database error - findById`, { table, id, error: error.message });
      throw new AppError(`Erreur lors de la récupération des données`, 500);
    }

    return data;
  }

  async findOne(table, filters, select = '*') {
    let query = supabaseAdmin.from(table).select(select);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      logger.error(`Database error - findOne`, { table, filters, error: error.message });
      throw new AppError(`Erreur lors de la récupération des données`, 500);
    }

    return data;
  }

  async findMany(table, filters = {}, options = {}) {
    const { select = '*', orderBy, limit, offset } = options;

    let query = supabaseAdmin.from(table).select(select, { count: 'exact' });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    if (orderBy) {
      const { column, ascending = true } = orderBy;
      query = query.order(column, { ascending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 20) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error(`Database error - findMany`, { table, filters, error: error.message });
      throw new AppError(`Erreur lors de la récupération des données`, 500);
    }

    return { data, count };
  }

  async create(table, data) {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) {
      logger.error(`Database error - create`, { table, error: error.message });
      throw new AppError(`Erreur lors de la création`, 500);
    }

    logger.info(`Record created`, { table, id: result.id });
    return result;
  }

  async update(table, id, data) {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Database error - update`, { table, id, error: error.message });
      throw new AppError(`Erreur lors de la mise à jour`, 500);
    }

    logger.info(`Record updated`, { table, id });
    return result;
  }

  async delete(table, id) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      logger.error(`Database error - delete`, { table, id, error: error.message });
      throw new AppError(`Erreur lors de la suppression`, 500);
    }

    logger.info(`Record deleted`, { table, id });
    return true;
  }
}

export default new DatabaseService();
