"use client";

type Branch = {
  id: number;
  name: string;
};

type Props = {
  branches: Branch[];
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  loadingBranches: boolean;
};

export default function LocationSelector({
  branches,
  selectedBranch,
  setSelectedBranch,
  loadingBranches,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-extrabold text-gray-900">
        Location
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Select the branch where your order will be handled.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Select Location *
        </label>

        {loadingBranches ? (
          <p className="text-sm text-gray-500">
            Loading locations...
          </p>
        ) : (
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">
              Select your location
            </option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </section>
  );
}