# Pokemon Showdown User Stats

The goal of this project is to track publicly available user stats on showdown. Particularly,
tracking elo over time. 

https://pokemonshowdownuserstats.com/

## Development

The project consists of backend components written in rust. Cloud AWS infrastructure written in
CDK, and a front end which uses Vite, react, and typescript with components from shadcn.

Currently, deployment is completed by manually pulling the AWS credentials and running:

```bash
make build-and-deploy
```

However, if others want to contribute, I can set up a pipeline that automatically deploys code
committed to the repo.

## API

Request all datapoints for a user by making a get request to the following. Replace the_brucey with the username.
```
https://pokemonshowdownuserstats.com/user-stats/the_brucey
```

Start tracking stats for a user by making a put request to the following. Replace the_brucey with the username.
```
https://pokemonshowdownuserstats.com/user-stats/the_brucey
```

## Issues

If you have any feature requests or identify any bugs, please submit an issue on this github page!
