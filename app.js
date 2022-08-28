require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { graphqlHTTP }= require('express-graphql');
const {
    GraphQLObjectType,
    GraphQLString, 
    GraphQLInt,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLList,
    GraphQLBoolean
} = require('graphql');

const contents = fs.readFileSync("db.json");
const Todos = JSON.parse(contents);
  
const TodoType = new GraphQLObjectType({
    name: 'Todo',
    description: 'This is a todo',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
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
                }
            return null
            }
        },
    })
});
  
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
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
//https://signoz.io/blog/angular-graphql/