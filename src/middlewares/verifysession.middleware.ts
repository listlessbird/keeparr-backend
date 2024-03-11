import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { LuciaService } from '../auth/lucia.service.js'
import type { User, Session } from 'lucia'

@Injectable()
export class verifySessionMiddleware implements NestMiddleware {
  constructor(private luciaService: LuciaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    Logger.log('Verifying session', verifySessionMiddleware.name)

    const sessionId = this.luciaService.readSessionCookie(
      req.headers.cookie ?? '',
    )

    console.log({ cookies: req.headers.cookie })

    console.log({ sessionId })

    if (!sessionId) {
      res.locals.user = null
      res.locals.session = null
      return next()
    }

    const { session, user } = await this.luciaService.validateSession(sessionId)

    if (session && session.fresh) {
      res.appendHeader(
        'Set-Cookie',
        this.luciaService.createSessionCookie(session.id).serialize(),
      )
    }

    if (!session) {
      res.appendHeader(
        'Set-Cookie',
        this.luciaService.createBlankSessionCookie().serialize(),
      )
    }

    res.locals.user = user
    res.locals.session = session

    console.log({ user, session })

    return next()
  }
}

declare global {
  namespace Express {
    interface Locals {
      user: User | null
      session: Session | null
    }
  }
}
