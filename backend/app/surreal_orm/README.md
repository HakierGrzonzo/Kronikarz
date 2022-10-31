# surrealORM

A simple wrapper over the `surreal.py` client based on pydantic.


## Capabilities:

- Table definitions
- Edge definitions
- basic CRUD

## Table operations:

A table can be defined using the following code:

```python
from pydantic import BaseModel
from surreal_orm import base 

@base.table 
class Example(BaseModel):
    # define table fields just like on the pydantic models
    field: str
```

### Object creation:

```python
from surreal_orm import get_db

async def create_example():
    # Create a session for the database operations
    session = await get_db()

    # properties are given as key word arguments. A table is selected 
    # as a attribiute of the session object.
    result = await session.Example.create(field="value")

    named_result = await session.Example.create_one(
        "foo", 
        field="this record has the `foo` id"
    )

    # Commit the transaction
    await session.commit()
```

### `SELECT` statements:

```python
from surreal_orm import get_db

async def select_example():
    # Create a session for the database operations
    session = await get_db()

    all_examples = await session.Example.select_all()
    
    # Conditional selections, that automatically fill in the WHERE clause
    conditional_selections = await session.Example.select("field = {}", ("foo"))
```

### Record links:

Record links can be defined like so:

```python
from surreal_orm import Relation

@base.table
class Tutorial(BaseModel):
    an_example: Relation[Example]

```

By default all record links are fetched as string ids, but you can use the 
`select_deep` operation to fetch them.

```
tutorials_with_examples = await session.Tutorial.select_deep("an_id", ['an_example'])
```

### Implied fields:

`surreal_orm` will automatically add an `id` field with type `str` for every 
table. It will hold the `id` from SurrealDB and will effectively function as a 
primary key.

## Graph operations:

Graph operations are very similar compared to table operations, every graph 
is effectively a table with a fancy `CREATE` method.

```python
@base.table
class Person(BaseModel):
    name: str

@base.table
class Car(BaseModel):
    marque: str


# This class will represent the `Person->Car` edge.
@base.relation(Person, Car)
class Trip(BaseModel):
    distance: int

```

### Creation:

When creating a relation, we need to specify the `in` or `from` object/id and 
the `out` or `to` object/id. A look at the figure below might be helpful.

```
[Person] from ---> in [Trip] out ---> to [CAR]

-- Diagram of terminology used with graph edges
```

As a result, the `create` operation requires those parameters.

```python
async def create_relation():
    session = await get_db()

    # let `chad` be a person with a random id
    chad = await session.Person.create(name="Chad")

    # let `miata` have an id of `Car:miata`
    miata = await session.Car.create_one('miata', name="Madzia")

    # chad drove the miata for 5 football fields, 
    # you can pass full objects or raw ids to the function
    trip = await session.Trip.create(chad, 'Car:miata', distance=5)

    await session.commit()
```

You can also query all the relations that come out from a given object using the
`select_related` method:

```python
async def select_driven_cars():
    session = get_db()

    # Return all `Trip`s that a person with id `chad` traveled. This method 
    # also fetches all the `Car`s 
    trips = await session.Person.select_related('chad', Drove)
```

### Implied fields:

`surreal_orm` will also add the following fields to your models:
- `id: str` - id of the edge
- `out: Relation[T]` - a string id or object that is a part of the graph edge
- `in: Relation[T]` - a string id or object that is a part of the graph edge, also 
aliased as `in_` as `in` is a python keyword

## Caveats

### Transactions:

Transactions are currently broken and do not rollback the data.

### `base` and `Base`

It is recommended to keep your schema definitions in one file. The ORM provides 
a `base` object of class `Base` that is used to keep track of all table definitions.
