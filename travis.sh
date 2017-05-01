#!/bin/sh

if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
  echo "This is a PR, skip."
  exit 0
fi

echo "DEBUG ENV: ${TRAVIS_JOB_NUMBER} ${TRAVIS_BUILD_NUMBER} ..."

if [ "${TRAVIS_BUILD_NUMBER}.1" != "${TRAVIS_JOB_NUMBER}" ]; then
  echo "Only run extra tasks 1 time 1 commit... quit."
  exit 0
fi

if [ "${TRAVIS_REPO_SLUG}" != "zordius/reservice" ]; then
  echo "Skip deploy because this is a fork... quit."
  exit 0
fi

# push coverage to codeclimate
npm install codeclimate-test-reporter
node_modules/.bin/codeclimate-test-reporter <coverage/lcov.info
