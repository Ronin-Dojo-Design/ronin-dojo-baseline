"use server"

import { searchTechniquesForPicker } from "~/server/admin/courses/queries"

export const searchTechniquesForPickerAction = async (q: string, brand?: string) => {
  return searchTechniquesForPicker(q, brand)
}
