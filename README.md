# Foobartory for Alma By Nadir Boufadene
For this project I chose a microservice approach with each entity communicating through events similarly as what we would do with signals in Django (Python framework) between apps. This is a lightweight implementation of the Event Sourcing architechtural design pattern. I chose this pattern because Alma's core business is highly transactional (payment).

For the interface I chose reactjs (without redux this time) to render a simple (arguably ugly) yet effective interface to display the game's state. And also because React is component oriented and this is perfectly adapted to Event Sourcing's paradigm (as we can see with the usage of redux for example).

I did not try to optimize the algorithm since it was not the primary goal of the test, but still tried to make it fast enough (averaging 190 ticks|seconds).

I would have liked to do it in TDD since the subject is well suited for it but, sadly, I lacked time.

You can speedup the game in the game config (reduce GAME_CLOCK_MS_MULTIPLIER in https://github.com/nadirboufadene/foobartory/blob/master/src/GameMechanics/config.ts)

# Premises
https://github.com/nadirboufadene/foobartory/blob/master/foobartory.md

# To launch the project
### `npm install && npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

You are invited to use `n` (https://github.com/tj/n) or `nvm` (https://github.com/nvm-sh/nvm/blob/master/README.md) to use the recommanded version of node for this project (see package.json).

# Disclaimer
At installation you might see `npm audit` raising warnings about vulnerabilities, but it is an issue between `npm audit` and `react-scripts`.
See https://github.com/facebook/create-react-app/issues/11581 and https://github.com/facebook/create-react-app/issues/11174


# Architecture philosophy
I chose to make a light simulation of an application using the Event Sourcing pattern. I did not go completely overboard in this direction as it would be too codebase heavy for a little project, but it is a good start to evolve it further in this direction with the addition of new game design features.

Each entity subscribes to the event store and publish or listen to the events through it, reacting to events it is depending on.
In the same logic our react components listen to these events through the store waiting for datas (as they would with a redux based approach).

# Algo solution
I chose to reduce robots movements to maximum as it is a heavy cost and unproductive task. It works in two stages.
 
In the first phase we have one robot which makes all the movements needed to construct the next 4 robots. The other robots are specialists and they will keep doing the task attributed at creation. We buy robots until every job is provisioned and then we go to phase 2.
 
In phase 2 we don't need a generalist robot anymore as all resources can be made by specialists, so the generalist robot becomes a specialist and we recruit more specialists using ratios between job specialists to determine which kind of specialist we need next. We keep only one robot to the buyer job as it has no cooldown so only one is necessary.

# Thoughts for improvements
* algorithm optimization
* UI - add timer on bots
* UI - improve design overall
* UI - feature to speedup the clock
* add tests
* Event Sourcing: separate Events from Commands
