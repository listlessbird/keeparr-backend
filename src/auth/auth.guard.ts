import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

/**
 * Maybe i should move the middleware logic here?
 * but since guards works after the middleware, this works for now
 */

@Injectable()
export class AuthGuard implements CanActivate{

    canActivate(ctx: ExecutionContext): boolean {
        const response = ctx.switchToHttp().getResponse()
        if(!response.locals.user) {
            throw new UnauthorizedException()
        }
        return true
    }
}