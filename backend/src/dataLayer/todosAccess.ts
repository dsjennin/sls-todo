import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from  '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger'
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'


const logger = createLogger('todosDataAccess');


export class TodosAccess{
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ){}

    async getUserTodos(userId: string): Promise<TodoItem[]>{
        logger.info(`Step 1 GetUserTodos.... ${userId}`)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
        const newId = uuid()
        const item = {} as TodoItem
        item.userId= userId
        item.todoId= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
  
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }


    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }


    async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate>{
        const paramsGet = {
          TableName: process.env.TODOS_TABLE,
          KeyConditionExpression: 'todoId = :todoIddelete',
          ExpressionAttributeValues: {
            ':todoIddelete': todoId,
          }
        }
        const todo = await this.docClient.query(paramsGet).promise()
      
        var params = {
          TableName: process.env.TODOS_TABLE,
          Key: { 
            todoId : todoId, 
            createdAt: todo.Items[0].createdAt 
          },
          UpdateExpression: 'set #name = :updatedName, #dueDate = :updatedDueDate, #done = :updatedDone',
          ExpressionAttributeNames: {'#name' : 'name', '#dueDate': 'dueDate', '#done': 'done'},
          ExpressionAttributeValues: {
            ':updatedName' : updatedTodo.name,
            ':updatedDueDate' : updatedTodo.dueDate,
            ':updatedDone' : updatedTodo.done,
          }
        };
        await this.docClient.update(params).promise();
    
    return updatedTodo
  }

    // async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string){
	// logger.info(`Updating a todo todoid = ${todoId} `);
	//  logger.info(`Updating a todo user = ${userId} `);
    //     await this.docClient.update({
    //         TableName: this.todosTable,
    //         Key:{
    //             todoId: todoId,
	// 	userId: userId
    //         },
    //         UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
    //         ExpressionAttributeValues: {
    //             ':n' : updatedTodo.name,
    //             ':d' : updatedTodo.dueDate,
    //             ':done' : updatedTodo.done
    //         },
    //         ExpressionAttributeNames:{
    //             "#namefield": "name"
    //           }
    //       }).promise()
    // }  
    
    async deleteTodo(todoId : string): Promise<any> {
        // First find the createdAt field for the todo, since it is part of the composite key
        const paramsGet = {
          TableName: process.env.TODOS_TABLE,
          KeyConditionExpression: 'todoId = :todoIddelete',
          ExpressionAttributeValues: {
            ':todoIddelete': todoId,
          }
        }
        const todo = await this.docClient.query(paramsGet).promise()
        logger.info('get todo', todo)
    
        const paramsDelete = {
          TableName : process.env.TODOS_TABLE,
          Key: {
            todoId: todoId,
            createdAt: todo.Items[0].createdAt
          }
        };
        
        await this.docClient.delete(paramsDelete).promise()
        logger.info('deleted todo', todo)
        return todo
      }
    



    // async deleteTodo(userId:string, todoId:string) {	
    //    await this.docClient.delete({
    //         TableName: this.todosTable,
    //         Key: {
	//        userId: userId,
    //            todoId: todoId
    //         }
    //    }).promise()
    // }



    
    // async updateTodoUrl(todoId: string,  attachmentUrl: string): Promise<void> {
    //     //logger.info(`URL change by ${todoId}`)
    //     //logger.info(`Updating a todo user = ${userId} `);
    
    //     await this.docClient.update({
    //       TableName: this.todosTable,
    //       Key: {
    //         todoId
    //       },
    //       UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    //       ExpressionAttributeValues: {
    //         ':attachmentUrl': attachmentUrl
    //       },
    //       ReturnValues: 'UPDATED_NEW'
    //     }).promise()
    //   }

      async updateTodoUrl(todoId: string,  attachmentUrl: string): Promise<void> {
        //logger.info(`URL change by ${todoId}`)
        //logger.info(`Updating a todo user = ${userId} `);

        const paramsGet = {
            TableName: process.env.TODOS_TABLE,
            KeyConditionExpression: 'todoId = :toUpdate',
            ExpressionAttributeValues: {
              ':toUpdate': todoId,
            }
          }
          const todo = await this.docClient.query(paramsGet).promise()
          logger.info('get todo', todo)

          var params = {
            TableName: process.env.TODOS_TABLE,
            Key: { 
              todoId : todoId, 
              createdAt: todo.Items[0].createdAt 
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl
          },
          ReturnValues: 'UPDATED_NEW'
            }
        
        
        await this.docClient.update(params).promise();
    
        
      }
}