import {CallExpr, LiteralExpr} from '../parser/expr';
import {Token, TokenType} from '../parser/token';

// ASSERT(FALSE)
export const CALL_ASSERT_FALSE = new CallExpr(
    new Token(TokenType.IDENTIFIER, 'ASSERT', null),
    [new LiteralExpr(false)]);