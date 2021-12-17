import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { parseUserId } from '../auth/utils'
//import { createLogger } from '../utils/logger'

//const logger = createLogger('todos')

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
export async function updateTodo(updatedTodo:UpdateTodoRequest,todoId:string){
	return await todosAccess.updateTodo(todoId, updatedTodo )
}

// deleteTodo is the interface of the delete method of todo
export async function deleteTodo(todoId:string) {
	return await todosAccess.deleteTodo(todoId)
}


export async function updateUrl(todoId: string, attachmentUrl: string): Promise<void> {

 // const userId = parseUserId(jwtToken)
  //logger.info(`Update URL  user = ${userId} `);

  return await todosAccess.updateTodoUrl(todoId,  attachmentUrl)
}
