import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
// import { createLogger } from '../utils/logger'

//const logger = createLogger('auth')

const todosAccess = new TodosAccess()

// const bucketName = process.env.IMAGES_BUCKET


export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getUserTodos(userId)
}

// createTodo is the interface of the create method
export async function createTodo(createTodoRequest: CreateTodoRequest,userId: string): Promise<TodoItem> {
	return await todosAccess.createTodo(createTodoRequest,userId)
}

// updateTodo is the update interface of the update todo method
export async function updateTodo(updatedTodo:UpdateTodoRequest,todoId:string, userId:string){
	return await todosAccess.updateTodo(updatedTodo, todoId, userId)
}

// deleteTodo is the interface of the delete method of todo
export async function deleteTodo(userId:string, todoId:string) {
	return await todosAccess.deleteTodo(userId, todoId)
}


export async function updateUrl(todoId: string, attachmentUrl: string, jwtToken: string): Promise<void> {

  const userId = parseUserId(jwtToken)
  return await todosAccess.updateTodoUrl(todoId, userId, attachmentUrl)
}
