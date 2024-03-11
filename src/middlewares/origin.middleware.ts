import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { verifyRequestOrigin } from 'lucia'

@Injectable()
export class OriginVerificationMiddleware implements NestMiddleware {
  //   constructor(private luciaService: LuciaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'development') return next()

    /* TODO:
    / rewrite the logic to accept from subdomains which verifyRequestOrigin does not support
    */

    if (req.method === 'GET') return next()

    console.log({
      headers: req.headers,
    })

    // set by the browser
    const originHeader = req.headers.origin ?? null

    // const hostHeader = req.headers.host ?? null

    let forwardedHost = (req.headers['x-forwarded-host'] as string) ?? null

    Logger.debug(
      `Verifying origin: 
        - origin: ${originHeader} 
        - host: ${req.headers.host}
        - forwarded: ${forwardedHost}
        `,
      OriginVerificationMiddleware.name,
    )

    if (
      !originHeader ||
      !forwardedHost ||
      !verifyRequestOrigin(originHeader, [forwardedHost])
    ) {
      return res.status(403).end()
    }
  }
}
