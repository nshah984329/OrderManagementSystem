#!/bin/bash

# Set database and connection details
DB_NAME="orderManagement"
MONGO_URI="mongodb://localhost:27017/orderManagemen"
EXPORT_PATH="./mongo_exports"

# Create export directory if not exists
mkdir -p $EXPORT_PATH

# Get all collection names
collections=$(mongo "$MONGO_URI" --quiet --eval "db.getCollectionNames().join('\n')")

# Loop through collections and export each
for collection in $collections
do
  echo "Exporting collection: $collection"
  mongoexport --uri="$MONGO_URI" --collection="$collection" --out="$EXPORT_PATH/$collection.json" --jsonArray
done

echo "✅ All collections exported successfully to $EXPORT_PATH/"
