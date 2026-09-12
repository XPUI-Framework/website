#!/bin/sh
# The gate: what CI runs, and what a change must pass before it is done.
exec node "$(dirname "$0")/scripts/gate.ts"
