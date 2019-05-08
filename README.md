Arion
=====

Arion is a talking horse... of course, of course. Arion listens for requests to
review GitHub pull requests (PRs) and notifies teams or individuals about
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

GitHub provides a nice interface to view recent deliveries to hooks, which can
be very useful for debugging. This interface includes the ability to inspect
outgoing request JSON payloads, view request and response HTTP headers, and
execute a redelivery.

Teams and individuals are defined in the `routes/index.js` file. If you want
to add an individual to the "userMap" array, you can look up his or her Slack
ID by viewing the user's profile in Slack and selecting "Copy member ID" from
the drop-down menu near the "Call" and "Message" buttons. This maps the user's
github account with their Slack ID.

After receiving a payload from GitHub, Arion processes it and sends it to a
Slack hook defined by a `SLACK_WEBHOOK` environment variable. This hook is
established in Slack using the "Incoming WebHooks" application configured to
post to the "@slackbot" channel. Slack integrations are bound to the user who
creates the hook and will stop working if the user's account is deactivated.

Deployment
----------

Arion is currently hosted on Heroku. In order to be able to redeploy Arion,
you'll need to register an account on Heroku and be added to the
"arion-the-talking-horse" project.

If you're using Homebrew, you can install the `heroku` command-line utility
by running:

    $ brew install heroku/brew/heroku

Get info about the application:

    $ heroku info --app arion-the-talking-horse

Set up a remote repository in this clone:

    $ heroku git:remote -a arion-the-talking-horse

Deploy a new version of the application:

    $ git push heroku master
