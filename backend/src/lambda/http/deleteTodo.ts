import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import {getTodoById} from  '../../businessLogic/todos'
const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('delete event', { event })
    const userId = getUserId(event)
    logger.info(`Delete TODO user id: ${userId}`)

    logger.info(`Delete TODO todo id: ${todoId}`)


    try {

    const oldTodo = await getTodoById(todoId);


      await deleteTodo(oldTodo, userId);

      logger.info('todo deleted:', todoId);

      return {
        statusCode: 204,
        body: 'success'
      }
    }
    catch (e) {
      logger.error('error deleting!', e)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )


