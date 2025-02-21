-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "overview" TEXT,
    "release_date" TIMESTAMP(3),
    "poster_path" TEXT,
    "backdrop_path" TEXT,
    "tmdbId" INTEGER NOT NULL,
    "runtime" INTEGER,
    "vote_average" DOUBLE PRECISION,
    "original_title" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");
