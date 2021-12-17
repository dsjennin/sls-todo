import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
//import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

  
    logger.info('delete event', { event })
    // const authorization = event.headers.Authorization
    // const split = authorization.split(' ')
    // const jwtToken = split[1]
    await deleteTodo(todoId)
    return {
      statusCode: 204,
      body: ''
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
