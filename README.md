Arion
=====

Arion is a talking horse... of course, of course. Arion listens for requests to
review GitHub pull requests (PRs) and notifies groups or individuals about
those PRs via Slack direct message.

Configuration
-------------

For a particular GitHub repository, two Web hooks are established in the
repository's settings:

* https://arion-the-talking-horse.herokuapp.com/pull-requests
* https://arion-the-talking-horse.herokuapp.com/pull-review

Both use a content type of `application/json` and only receive specific events.
The "pull-requests" hook only receives "Pull requests" events, while the
"pull-review" hook only receives "Pull request reviews" events.

Groups and individuals are defined in the `routes/index.js` file. If you want
to add an individual to the "userMap" array, you can look up his or her Slack
ID by viewing the user's profile in Slack and selecting "Copy member ID" from
the drop-down menu near the "Call" and "Message" buttons.

Deployment
----------

Arion is currently hosted on Heroku. In order to be able to redeploy Arion,
you'll need to register an account on Heroku and be added to the
"arion-the-talking-horse" project.

If you're using Homebrew, you can install the `heroku` command-line utility
by running::

    $ brew install heroku/brew/heroku

You can get info about the application by running::

    $ heroku info --app arion-the-talking-horse

You can set up a remote repository in this clone by running::

    $ heroku git:remote -a arion-the-talking-horse

If you want to deploy a new version of the application, you can run::

    $ git push heroku master
