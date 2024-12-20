import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { X } from "lucide-react";
import { cn } from "@/utils";
import { LanguageCodes, SortBy } from "@shared/consts";
import {
  searchQueryAtom,
  searchCountAtom,
} from "@/atoms/searchAtoms";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ======== Main Component ========

const SearchBox = ({ onClose }: { onClose: () => void }) => {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  // Maybe change to atom setter
  const [, setSearchCount] = useAtom(searchCountAtom);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearchQueryUpdate = useCallback((key: string) => {
    return (value: string) => {
      setSearchQuery((prev) => ({ ...prev, [key]: value }));
    };
  }, []);

  // The search action function
  const searchAction = useCallback(async () => {
    setLoading(true);
    await window.context.getSearchResults(searchQuery);
    navigate("/search"); // trigger the loader funciton once the search completed
    setLoading(false);
    setSearchCount((prev) => prev + 1);
  }, [searchQuery]);

  const validDates = (() => {
    if (searchQuery.from && searchQuery.to) {
      const fromDate = new Date(searchQuery.from);
      const toDate = new Date(searchQuery.to);
      return fromDate < toDate;
    }
    return true;
  })();

  const keywordsMissing =
    searchQuery.keywords !== undefined &&
    searchQuery.keywords.length === 0;

  return (
    <div className="w-full h-full py-4 px-5 flex flex-col gap-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="font-serif font-semibold text-lg">
          New Search
        </h1>
        <X className="w-5 hover:cursor-pointer" onClick={onClose} />
      </div>
      {/* Keywords */}
      <SearchBlock title="Keywords (separate by comma) *">
        <textarea
          className={cn(
            "resize-none w-full outline-primary/30 outline rounded-[0.3rem] px-1 py-[2px] font-mono font-light tracking-tight focus-visible:outline-primary focus-visible:outline-2",
            keywordsMissing && "outline-destructive/80 outline-2"
          )}
          defaultValue={searchQuery.keywords}
          onBlur={(e) =>
            handleSearchQueryUpdate("keywords")(e.target.value)
          }
          required={true}
        />
      </SearchBlock>
      {/* Language */}
      <SearchBlock title="Language">
        <Options
          type={"languages"}
          placeholder={searchQuery.language || "English"}
          onChange={handleSearchQueryUpdate("language")}
        />
      </SearchBlock>
      {/* Sort by */}
      <SearchBlock title="Sort By">
        <Options
          type={"sortBy"}
          placeholder="Relevance"
          onChange={handleSearchQueryUpdate("sortBy")}
        />
      </SearchBlock>
      <div className="flex justify-between">
        {/* From date */}
        <SearchBlock title="From">
          <DatePicker
            onChange={handleSearchQueryUpdate("from")}
            valid={validDates}
          />
        </SearchBlock>
        {/* To date */}
        <SearchBlock title="To">
          <DatePicker
            onChange={handleSearchQueryUpdate("to")}
            valid={validDates}
          />
        </SearchBlock>
      </div>
      <div className="flex-1 content-end">
        <div className="pb-1">
          {keywordsMissing && (
            <p className="text-sm text-destructive/80 italic">
              *The keywords field is required.
            </p>
          )}
          {!validDates && (
            <p className="text-sm text-destructive/80 italic">
              *Invalid date range.
            </p>
          )}
        </div>
        <Button
          className="w-full"
          disabled={
            keywordsMissing ||
            searchQuery.keywords === undefined ||
            !validDates ||
            loading
          }
          onClick={searchAction}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
};

// ======== Sub Components ========

const Options = ({
  type,
  placeholder,
  onChange,
}: {
  type: "languages" | "sortBy";
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const options = type === "languages" ? LanguageCodes : SortBy;
  return (
    <div>
      <Select onValueChange={onChange}>
        <SelectTrigger className="h-7 rounded-[0.3rem] border-primary/30 px-2 py-[2px] font-mono focus:ring-offset-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {Object.entries(options).map(([name, _]) => (
            <SelectItem
              key={`search-lan-${name}`}
              className="font-mono"
              value={name}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const DatePicker = ({
  onChange,
  valid = true,
}: {
  onChange: (string) => void;
  valid?: boolean;
}) => {
  const maxDate = new Date().toISOString().split("T")[0];
  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
  const minDate = fiveMonthsAgo.toISOString().split("T")[0];
  return (
    <input
      type="date"
      max={maxDate}
      min={minDate}
      className={cn(
        "border w-32 border-primary/30 rounded-[0.3rem] px-1 py-[2px] font-mono text-sm font-light tracking-tight focus-visible:outline-primary",
        cn(!valid && "border-destructive/80 border-2")
      )}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const SearchBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <h3 className="text-sm mb-1">{title}</h3>
      {children}
    </div>
  );
};

export default SearchBox;
