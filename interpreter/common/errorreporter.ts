import { Token } from '../parser/token';

export type ScannerErrorReporter = (line: number, column: number, message: string) => void;
export type ParserErrorReporter = (token: Token, message: string) => void;