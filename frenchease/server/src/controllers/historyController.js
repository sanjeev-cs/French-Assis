import { deleteHistoryEntry, getHistoryPage } from '../services/historyService.js';
import { HttpError } from '../utils/httpError.js';

export const listHistory = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(requestedLimit, 1), 20);
    const result = await getHistoryPage({ userId: req.user.id, page, limit });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const removeHistory = async (req, res, next) => {
  try {
    const deleted = await deleteHistoryEntry({ id: req.params.id, userId: req.user.id });

    if (!deleted) {
      throw new HttpError('History entry not found.', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
