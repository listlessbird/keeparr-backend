import { Module } from '@nestjs/common'
import { drizzleProvider } from './drizzle.provider.js'

@Module({
  providers: [...drizzleProvider],
  exports: [...drizzleProvider],
})
export class DrizzleModule {}
