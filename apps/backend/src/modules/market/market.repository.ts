import { InstrumentModel } from './instrument.model';
import { Instrument, Quote, Candle, HistoricalDataRequest } from './types';

export class MarketRepository {
  async findInstruments(filters: {
    exchange?: string;
    instrumentType?: string;
    status?: string;
    search?: string;
  }, page = 1, limit = 50) {
    const query: any = { status: filters.status || 'active' };
    
    if (filters.exchange) {
      query.exchange = filters.exchange;
    }
    
    if (filters.instrumentType) {
      query.instrumentType = filters.instrumentType;
    }
    
    if (filters.search) {
      query.$or = [
        { symbol: { $regex: filters.search, $options: 'i' } },
        { name: { $regex: filters.search, $options: 'i' } },
        { isin: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [instruments, total] = await Promise.all([
      InstrumentModel.find(query)
        .sort({ symbol: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InstrumentModel.countDocuments(query),
    ]);
    
    return {
      data: instruments as any[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findInstrumentBySymbol(symbol: string, exchange: string) {
    return InstrumentModel.findOne({ symbol, exchange }).lean();
  }

  async findInstrumentsByExpiry(exchange: string, instrumentType: string) {
    return InstrumentModel.distinct('expiryDate', {
      exchange,
      instrumentType,
      status: 'active',
      expiryDate: { $exists: true, $ne: null },
    });
  }

  async findFuturesOptions(underlying: string, exchange: string) {
    return InstrumentModel.find({
      underlying,
      exchange,
      instrumentType: { $in: ['FUT', 'OPT'] },
      status: 'active',
    })
    .sort({ expiryDate: 1, strikePrice: 1 })
    .lean();
  }

  async bulkUpsertInstruments(instruments: Partial<Instrument>[]) {
    if (instruments.length === 0) return;
    
    const operations = instruments.map(inst => ({
      updateOne: {
        filter: { 
          symbol: inst.symbol!, 
          exchange: inst.exchange! 
        },
        update: { $set: inst as any },
        upsert: true,
      },
    }));
    
    await InstrumentModel.bulkWrite(operations);
  }

  async activateInstrument(id: string) {
    return InstrumentModel.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    );
  }

  async deactivateInstrument(id: string) {
    return InstrumentModel.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );
  }

  async getActiveEquityCount() {
    return InstrumentModel.countDocuments({
      exchange: 'NSE',
      instrumentType: 'EQ',
      status: 'active',
    });
  }

  async searchInstruments(query: string, limit = 20) {
    return InstrumentModel.find({
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
      status: 'active',
    })
    .limit(limit)
    .lean();
  }
}

export const marketRepository = new MarketRepository();
