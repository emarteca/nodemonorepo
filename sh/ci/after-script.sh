echo 'Reporting coverage information...'
stcode=0

echo '  → To Coveralls <https://coveralls.io/>'
cat ./coverage/lcov.info | coveralls
((stcode|=$?))

echo '  → To Codecov <https://codecov.io/>'
codecov
((stcode|=$?))

echo 'Diffing lock file...'
echo '  → pnpm-lock.yaml ≏ pnpm-lock.yaml.old.tmp'
diff pnpm-lock.yaml pnpm-lock.yaml.old.tmp

echo 'Checking warnings...'
echo '  → node-warnings.log'
if [[ -f node-warnings.log ]]
  then
    echo 'Warning file exists'
    cat node-warnings.log
  else
    echo 'No warnings.'
fi

exit $stcode
