import {DirectoryType} from "./notes/dto/notes-dto.js"


export type Note = {
  id: string
  name: string
  blocks: { [key: string]: any }[]
  directory?: DirectoryType
}
