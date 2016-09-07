# ORGy

*This experience was designed during the MusicTechFest - CoSiMa workshop - Berlin, May 2016.*

> @todo app description

## Credits

> @todo add names (designed by, developped by)

The application is developped using the [`soundworks`](https://github.com/collective-soundworks/soundworks) framework and [`soundworks-template`](https://github.com/collective-soundworks/soundworks-template) application.

## Requirements

[NodeJS](https://nodejs.org/en/) (version >= 0.12)
> Version LTS is recommanded (Long Term Stable), currently v4.5.0 for most users.

The application also requires the use of a midi keyboard connected to the computer running the node server.

## Installation / Configuration

- Download the application from the [github](https://github.com/collective-soundworks-workshops/201605-musictechfest-mtf-orgy) repository

- Open a terminal and move to the application directory

```
$ cd path/to/201605-musictechfest-mtf-orgy
```

- Install dependencies

```
$ npm install
```

- Run the provided utilitary script to get the list of the connected MIDI devices

```
$ node ./utils/midi-list.js
```

The script should output something like (results may change according to your configuration)

```
Connected midi devices:
- MIDI port 0: "IAC Driver Bus 1"
```

Copy the name of the device you want to use as a controller (for example `IAC Driver Bus 1`)

Open the file `./src/server/config/default.js` in a text editor and paste the name of your interface as the value of the `midiName` entry (line 16). Using the exemple value `IAC Driver Bus 1`, the config file should look like this:

```
  // ...
  appName: 'ORGy',

  // Name of the midi interface
  midiName: 'IAC Driver Bus 1',

  // ...
```

For production use, you can also set the `env` entry to `'production'` and `port` entry to `80`.

Then to launch the application, run:

```
$ npm run transpile
$ npm run minify
$ node ./server/index.js
```

If the MIDI interface is found you should be able to see the following line in the console: 
```
$ > Opening MIDI port 0: "IAC Driver Bus 1"
```
ortherwise
```
$ > MIDI port name "IAC Driver Bus 1" not found
```

On the computer running the server, the client should be accessible at the following urls:
- [player] `http://127.0.0.1/`
- [organ]  `http://127.0.0.1/organ`
- [conductor] `http://127.0.0.1/conductor`

To access the application from a smartphone or a different computer just replace `127.0.0.1` by your public ip on the wifi network.




