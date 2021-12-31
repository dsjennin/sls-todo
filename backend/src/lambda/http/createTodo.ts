import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils';

const logger = createLogger('createTodo')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info(` Lambda - Step 1 Create To DO for user:  ${JSON.stringify(event)}`)
    
    
  const createNew: CreateTodoRequest = JSON.parse(event.body)
  //const authorization = event.headers.Authorization
  //const split = authorization.split(' ')
  //const jwtToken = split[1]
  const userId = getUserId(event)

  logger.info(` Lambda - Step 2 Create To DO for user:  ${userId}`) 


  const items = await createTodo(createNew, userId)
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: items
    })
  }
}
)

handler.use(
  cors({
    credentials: true
  })
)
