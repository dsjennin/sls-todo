import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
//import { getUserId} from '../../helpers/authHelper'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('update event', {event})
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    //const authorization = event.headers.Authorization
    //const split = authorization.split(' ')
    //const jwtToken = split[1]
    const userId = getUserId(event)
    logger.info(`UPDATE TODO ${userId}`) 


    //await updateTodo(todoId, updatedTodo, jwtToken)


    logger.info(`User ${userId} updating group ${todoId} to be ${updatedTodo}`)
    await updateTodo(updatedTodo, todoId, userId)
  
    return {
      statusCode: 200,
      body: JSON.stringify({})
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
