import { Op } from "sequelize";

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  programID?: string | number;
}

export interface ParsedQuery {
  where: any;
  pagination: {
    limit: number;
    offset: number;
    page: number;
  };
}

export function parseQuery(query: PaginationQuery): ParsedQuery {
  const { page = 1, limit = 10, search, programID } = query;

  const pageNum = Math.max(parseInt(page as string, 10), 1);
  const limitNum = Math.max(parseInt(limit as string, 10), 1);
  const offset = (pageNum - 1) * limitNum;

  const where: any = {};

  if (programID) {
    where.programID = programID;
  }

  if (search) {
    where.name = {
      [Op.iLike]: `%${search}%`, // only PostgreSQL
    };
  }

  return {
    where,
    pagination: { limit: limitNum, offset, page: pageNum },
  };
}
