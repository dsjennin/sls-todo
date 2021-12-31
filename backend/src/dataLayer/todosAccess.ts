import { TodoItem } from '../models/TodoItem';
//import { TodoUpdate } from  '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger'
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'
import { SNSAccess } from './snsAccess';


const logger = createLogger('todosDataAccess');

const sns = new AWS.SNS;
const snsArn = process.env.SNS_ARN
//const snsArn = 'arn:aws:sns:us-east-1:484412911256:todostopic-dev'
const topic = process.env.TOPIC_NAME
//const topic = 'todostopic-dev'



const mySns = new SNSAccess(sns, snsArn, topic)

export class TodosAccess{
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.TODOS_USERID_INDEX,
        //private readonly todoUseridIndex = process.env.TODOS_USERID_INDEX,
        private readonly todoIdIndex = process.env.TODOS_TODOID_INDEX,
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



    async getUserTodoCount(userId: string): Promise<number>{
      logger.info(`Step 1 GetUserTodos.... ${userId}`)
      const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.userIdIndex,
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: 'done = :done',
          ExpressionAttributeValues:{
              ':userId':userId,
              ':done': false
          }
      }).promise()
      return result.Items.length
  }

    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
      logger.info(` Data Access - Step 1 Create To DO for user:  ${userId}`)

        const newId = uuid()
        const item = {} as TodoItem
        item.userId= userId
        item.todoId= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
        item.attachmentUrl = ''

        logger.info(` Data Access - Step 2 table name:  ${this.todosTable}`)
        logger.info(` Data Access - Step 3 Create To DO item :  ${JSON.stringify(item)}`)
  
        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()
        logger.info(`Step 4 Should have inserted new record:  ${newId}`)
        mySns.publishNewTodoMessage(item.name)
        return item
    }


    async getTodoById(todoId: String): Promise<TodoItem> {
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todoIdIndex,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
        },
        ScanIndexForward: false
      }).promise()
  
      const item = result.Items
      return item[0] as TodoItem
    }


  //   async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate>{
  //       const paramsGet = {
  //         TableName: process.env.TODOS_TABLE,
  //         KeyConditionExpression: 'todoId = :todoIddelete',
  //         ExpressionAttributeValues: {
  //           ':todoIddelete': todoId,
  //         }
  //       }
  //       const todo = await this.docClient.query(paramsGet).promise()
      
  //       var params = {
  //         TableName: process.env.TODOS_TABLE,
  //         Key: { 
  //           todoId : todoId, 
  //           createdAt: todo.Items[0].createdAt 
  //         },
  //         UpdateExpression: 'set #name = :updatedName, #dueDate = :updatedDueDate, #done = :updatedDone',
  //         ExpressionAttributeNames: {'#name' : 'name', '#dueDate': 'dueDate', '#done': 'done'},
  //         ExpressionAttributeValues: {
  //           ':updatedName' : updatedTodo.name,
  //           ':updatedDueDate' : updatedTodo.dueDate,
  //           ':updatedDone' : updatedTodo.done,
  //         }
  //       };
  //       await this.docClient.update(params).promise();
  //       mySns.publishDoneTodoMessage(updatedTodo.name)
    
  //   return updatedTodo
  // }

 async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string, currentUserId: string){
	 logger.info(`Updating a todo todoid = ${todoId} `);
	 logger.info(`Updating a todo user = ${currentUserId} `);
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                todoId: todoId,
		            userId: currentUserId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done,
                ':userId' : currentUserId,
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              },
              ConditionExpression: 'userId = :userId',
          }).promise()
          mySns.publishDoneTodoMessage(updatedTodo.name)
    }  
    
    // async deleteTodo(todoId : string): Promise<any> {
    //     // First find the createdAt field for the todo, since it is part of the composite key
    //     const paramsGet = {
    //       TableName: process.env.TODOS_TABLE,
    //       KeyConditionExpression: 'todoId = :todoIddelete',
    //       ExpressionAttributeValues: {
    //         ':todoIddelete': todoId,
    //       }
    //     }
    //     const todo = await this.docClient.query(paramsGet).promise()
    //     logger.info('get todo', todo)
    
    //     const paramsDelete = {
    //       TableName : process.env.TODOS_TABLE,
    //       Key: {
    //         todoId: todoId,
    //         createdAt: todo.Items[0].createdAt
    //       }
    //     };
        
    //     await this.docClient.delete(paramsDelete).promise()
    //     logger.info('deleted todo', todo)
    //     return todo
    //   }
    



    async deleteTodo(todo: TodoItem, currentUserId:string) {	
      console.log('deleting item', todo)
      const deleteditem = await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
	             userId: todo.userId,
               todoId: todo.todoId
            },
            ConditionExpression:"userId = :currentUserId",
            ExpressionAttributeValues: {
              ":currentUserId": currentUserId
            }   
       }).promise();
       logger.info('deleted todo', deleteditem)
       return todo;
    }



    
    async updateTodoUrl(userId: string, todoId: string,  attachmentUrl: string): Promise<void> {
        logger.info(`URL change by ${todoId}`)
        logger.info(`Updating a todo user = ${userId} `);
    
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            todoId: todoId,
            userId: userId
          },
          UpdateExpression: 'set attachmentUrl = :attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachmentUrl,
            ':todoId' : todoId,
            ':userId' : userId,
          },
          ConditionExpression: 'todoId = :todoId and userId = :userId',
          ReturnValues: 'UPDATED_NEW'
        }).promise();
      }

      // async updateTodoUrl(todoId: string,  attachmentUrl: string): Promise<void> {
      //   //logger.info(`URL change by ${todoId}`)
      //   //logger.info(`Updating a todo user = ${userId} `);

      //   const paramsGet = {
      //       TableName: process.env.TODOS_TABLE,
      //       KeyConditionExpression: 'todoId = :toUpdate',
      //       ExpressionAttributeValues: {
      //         ':toUpdate': todoId,
      //       }
      //     }
      //     const todo = await this.docClient.query(paramsGet).promise()
      //     logger.info('get todo', todo)

      //     var params = {
      //       TableName: process.env.TODOS_TABLE,
      //       Key: { 
      //         todoId : todoId, 
      //         createdAt: todo.Items[0].createdAt 
      //       },
      //       UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      //     ExpressionAttributeValues: {
      //       ':attachmentUrl': attachmentUrl
      //     },
      //     ReturnValues: 'UPDATED_NEW'
      //       }
        
        
      //   await this.docClient.update(params).promise();
    
        
      // }
}