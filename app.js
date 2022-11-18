require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLObjectType,
    GraphQLString, 
    GraphQLInt,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLList,
    GraphQLBoolean
} = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const pubSub = new PubSub;

const content = fs.readFileSync("db.json");
const Todos = JSON.parse(content);

const TodoType = new GraphQLObjectType({
    name: 'Todo',
    description: 'This is a todo',
    fields: () => ({
        id: { 
            type: new GraphQLNonNull(GraphQLInt) 
        },
        name: { 
            type: new GraphQLNonNull(GraphQLString) 
        },
        description: { 
            type: new GraphQLNonNull(GraphQLString) 
        },
    })
});
  
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        todos: {
            type: new GraphQLList(TodoType),
            description: 'List of All Todos',
            resolve: () => Todos
        },
        todo:{
            type: TodoType,
            description: 'Single Todo',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            resolve: (root, args) => {
                return Todos.find(todo => todo.id === args.id)
            }
        }
    })
});
  
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addTodo: {
            type: TodoType,
            description: 'Add a new Todo',
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                description: {
                    type: new GraphQLNonNull(GraphQLString)
                },
            },
            resolve: (root, args) => {
                const newTodo = {
                    id: Todos.length + 1,
                    name: args.name,
                    description: args.description,
                }
                Todos.push(newTodo)
                return newTodo
            }
        },
        updateTodo: {
            type: TodoType,
            description: 'Update a Todo',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                description: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, args) => {
                let updateTodo = Todos.find(todo => todo.id === args.id);

                updateTodo.name = args.name;
                updateTodo.description = args.description;

                return updateTodo;
            }
        },
        updateTodo: {
            type: TodoType,
            description: 'Update a Todo',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                description: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (root, args) => {
                let updateTodo = Todos.find(todo => todo.id === args.id);

                updateTodo.name = args.name;
                updateTodo.description = args.description;

                return updateTodo;
            }
        },
        deleteTodo: {
            type: TodoType,
            description: 'Delete a Todo',
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            resolve: (root, args) => {
                const todo = Todos.find(todo => todo.id === args.id)
                if(todo){
                    Todos.splice(Todos.indexOf(todo), 1)
                    return todo
                } else if(!todo) {
                    throw new Error("Todo not found!!!");
                }
            return null
            }
        },
    }) 
});

const RootSubscriptionType = new GraphQLObjectType({
    name: 'Subscription',
    description: 'Root Subscription',
    fields: () => ({
        type: new GraphQLList(TodoType),
        description: 'Todos Subscription',
        
        toto_added: {
            type: new GraphQLNonNull(TodoType),
            subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator("NEW_TODO"),
        },
        toto_updated: {
            type: new GraphQLNonNull(TodoType),
            subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator("UPDATED_TODO"),
        },
        todo_deleted: {
            type: new GraphQLNonNull(TodoType),
            subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator("DELETED_TODO"),
        }
    })
})
  
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
    subscription: RootSubscriptionType
});
  
const app = express();
  
app.use(cors());
app.set('port', process.env.PORT || 3001);
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));
  
app.listen(app.get('port'), () => {
    console.log(`Web app avalible at http://127.0.0.1:${app.get('port')}`);
});