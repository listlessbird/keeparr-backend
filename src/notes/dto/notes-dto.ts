import { z } from 'zod'

export const createNotesSchema = z
  .object({
    name: z.string(),
    blocks: z.array(z.record(z.any())),
  })
  .required()

export type CreateNotesDto = z.infer<typeof createNotesSchema>
