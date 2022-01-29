<template>
  <h1>Frilansare Sverige</h1>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
}

h1, h2, h3, h4 {
  margin: 0;
  padding: 0;
}

h1 {
  border-bottom: 1px dotted #cccccc;
  padding-bottom: 20px;
  margin-top: 20px;
}

h2 {
  margin-top: 20px;
}

h2, h3, h4 {
  margin-bottom: 5px;
}

p {
  margin: 0;
  padding: 0;
  margin-bottom: 25px;
}

a, a:active, a:hover {
  color: #005FA4;
  text-decoration: none;
}

a:hover {
  color: #005FA4;
  text-decoration: underline;
  cursor: pointer;
}

a:visited {
  text-decoration: none;
}

input, textarea {
  display: block;
  margin: 5px 0 25px;
  width: 100%;
  padding: 5px;
  font-size: 1.5em;
  border: 1px solid #aaaaaa;
  color: #444444;
  border-radius: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  resize: none;
  box-sizing: border-box;
}

input[type='submit'] {
  width: auto;
  padding: 5px 25px;
  cursor: pointer;
  background-color: #bbffb9;
}

input[disabled] {
  background-color: #aaaaaa;
  color: #777777;
  cursor: default;
}

input[type='submit']:active {
  background-color: #cccccc;
}

input:active, textarea:active, input:focus-visible, textarea:focus-visible {
  outline: none;
  border: 1px solid #444444;
  color: #222222;
}

.columns {
  display: flex;
  margin: 0 -10px;
}

.columns > .column {
  padding: 0 10px;
  width: 100%;
}

@media (max-width: 768px) {
  .columns {
    flex-wrap: wrap;
    margin: 0;
  }

  .columns > .column {
    flex-shrink: 0;
    padding: 0;
  }
}
</style>