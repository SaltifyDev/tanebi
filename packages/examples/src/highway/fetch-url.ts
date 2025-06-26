import { ctx } from 'tanebi';
import bot from '../login/fast';
import { FetchHighwayUrlOperation } from '@/internal/operation/highway/FetchHighwayUrlOperation';

const fetchResult = await bot[ctx].call(FetchHighwayUrlOperation);
console.log(fetchResult);