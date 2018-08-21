Arion is a talking horse...of course, of course

If you're using Homebrew, you can install the `heroku` command-line utility
by running::

    $ brew install heroku/brew/heroku

You can get info about the application by running::

    $ heroku info --app arion-the-talking-horse

You can set up a remote repository in this clone by running::

    $ heroku git:remote -a arion-the-talking-horse

If you want to deploy a new version of the application, you can run::

    $ git push heroku master
