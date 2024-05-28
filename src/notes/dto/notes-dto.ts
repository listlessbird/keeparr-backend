import { z } from 'zod'

const directorySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
})

export type DirectoryType = z.infer<typeof directorySchema> & { parentDirectory?: DirectoryType }


const directorySchemaRecursed : z.ZodType<DirectoryType> = directorySchema.extend({
  parentDirectory: z.lazy(() => directorySchemaRecursed)
})

export const createNotesSchema = z
  .object({
    name: z.string().min(1),
    directory: directorySchemaRecursed,
    blocks: z.array(z.record(z.any())),
  })
  

export type CreateNotesDto = z.infer<typeof createNotesSchema>
