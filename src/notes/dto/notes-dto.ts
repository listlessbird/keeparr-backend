import { z } from 'zod'

export const createNotesSchema = z
  .object({
    name: z.string(),
    id: z.string(),
    blocks: z.array(z.object({})),
  })
  .required()

export type CreateNotesDto = z.infer<typeof createNotesSchema>
