// 模拟API集合数据
export const mockCollections = [
  {
    id: '1',
    name: 'User Management',
    description: '用户管理相关API',
    expanded: true,
    apis: [
      {
        id: '1-1',
        name: 'Get Users',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users',
        description: '获取用户列表',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {},
        body: '',
      },
      {
        id: '1-2',
        name: 'Create User',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/users',
        description: '创建新用户',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {},
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe'
        }, null, 2),
      },
      {
        id: '1-3',
        name: 'Update User',
        method: 'PUT',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        description: '更新用户信息',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {},
        body: JSON.stringify({
          id: 1,
          name: 'John Doe Updated',
          email: 'john.updated@example.com',
          username: 'johndoe'
        }, null, 2),
      },
      {
        id: '1-4',
        name: 'Delete User',
        method: 'DELETE',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        description: '删除用户',
        headers: {},
        params: {},
        body: '',
      },
    ]
  },
  {
    id: '2',
    name: 'Posts API',
    description: '文章管理相关API',
    expanded: false,
    apis: [
      {
        id: '2-1',
        name: 'Get Posts',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts',
        description: '获取文章列表',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          _limit: '10',
          _page: '1',
        },
        body: '',
      },
      {
        id: '2-2',
        name: 'Get Post by ID',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        description: '根据ID获取文章',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {},
        body: '',
      },
      {
        id: '2-3',
        name: 'Create Post',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        description: '创建新文章',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {},
        body: JSON.stringify({
          title: 'New Post Title',
          body: 'This is the content of the new post.',
          userId: 1
        }, null, 2),
      },
    ]
  },
  {
    id: '3',
    name: 'Comments API',
    description: '评论管理相关API',
    expanded: false,
    apis: [
      {
        id: '3-1',
        name: 'Get Comments',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/comments',
        description: '获取评论列表',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          postId: '1',
        },
        body: '',
      },
    ]
  },
]

// 模拟响应数据
export const mockResponses = {
  '1-1': {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': '5645',
      'Connection': 'keep-alive',
    },
    data: [
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        address: {
          street: 'Kulas Light',
          suite: 'Apt. 556',
          city: 'Gwenborough',
          zipcode: '92998-3874',
        },
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
      },
      {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        address: {
          street: 'Victor Plains',
          suite: 'Suite 879',
          city: 'Wisokyburgh',
          zipcode: '90566-7771',
        },
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
      },
    ],
    time: 245,
    size: '5.5 KB',
  },
}

// 模拟环境变量
export const mockEnvironments = [
  {
    id: 'dev',
    name: 'Development',
    variables: {
      baseUrl: 'https://api-dev.example.com',
      apiKey: 'dev-api-key-123',
      timeout: '5000',
    },
  },
  {
    id: 'staging',
    name: 'Staging',
    variables: {
      baseUrl: 'https://api-staging.example.com',
      apiKey: 'staging-api-key-456',
      timeout: '10000',
    },
  },
  {
    id: 'prod',
    name: 'Production',
    variables: {
      baseUrl: 'https://api.example.com',
      apiKey: 'prod-api-key-789',
      timeout: '15000',
    },
  },
]
