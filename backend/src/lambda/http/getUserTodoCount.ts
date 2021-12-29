import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

//import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserTodoCount } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

//import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
const logger = createLogger('getToDos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    logger.info('get todos  event: ${JSON.stringify(event)}')
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const count = await getUserTodoCount(jwtToken)
    logger.info(`Get all TODO items for current user.... ${count}`)
    return {
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true 
        },
      body: JSON.stringify({ count
        
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
