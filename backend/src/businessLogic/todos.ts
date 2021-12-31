import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { parseUserId } from '../auth/utils'
//import { createLogger } from '../utils/logger'

//const logger = createLogger('todos')

const todosAccess = new TodosAccess()

// const bucketName = process.env.IMAGES_BUCKET

export async function getTodoById(
  todoId: string,
): Promise<TodoItem> {
  return todosAccess.getTodoById(todoId)
}


export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getUserTodos(userId)
}


export async function getUserTodoCount(userId: string): Promise<number> {
  return await todosAccess.getUserTodoCount(userId)
}
// createTodo is the interface of the create method
export async function createTodo(createTodoRequest: CreateTodoRequest,userId: string): Promise<TodoItem> {

  console.log('createTodo Business Logic : userID: ' + userId)
	return await todosAccess.createTodo(createTodoRequest,userId)
}

// updateTodo is the update interface of the update todo method
export async function updateTodo(updatedTodo:UpdateTodoRequest,todoId:string, currentUserId: string){
	return await todosAccess.updateTodo(updatedTodo, todoId, currentUserId )
}

// deleteTodo is the interface of the delete method of todo
export async function deleteTodo(todo:TodoItem, userId: string):  Promise<TodoItem>  {
	return await todosAccess.deleteTodo(todo, userId)
}


export async function updateUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {

 
 console.log(`Update URL  user = ${userId} `);

  return await todosAccess.updateTodoUrl(userId, todoId,  attachmentUrl)
}
