import { Token } from '../parser/token';

export type ScannerErrorReporter = (position: number, message: string) => void;
export type ParserErrorReporter = (token: Token, message: string) => void;